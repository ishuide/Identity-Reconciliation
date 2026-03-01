import { PrismaClient, Contact } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReconciliationResponse {
    contact: {
        primaryContatctId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}

export async function identifyContact(email?: string, phoneNumber?: string): Promise<ReconciliationResponse> {
    // 1. Find directly matching contacts
    const directMatches = await prisma.contact.findMany({
        where: {
            OR: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined },
            ],
        },
    });

    if (directMatches.length === 0) {
        // Rule A: New Identity
        const newContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            },
        });
        return formatResponse(newContact.id);
    }

    // 2. Identify all unique primary contact IDs associated with matches
    const primaryIds = new Set<number>();
    directMatches.forEach(c => {
        primaryIds.add(c.linkedId || c.id);
    });

    // Fetch all primary contacts to find the oldest one
    const primaries = await prisma.contact.findMany({
        where: {
            id: { in: Array.from(primaryIds) },
            linkPrecedence: 'primary',
        },
        orderBy: { createdAt: 'asc' },
    });

    if (primaries.length === 0) {
        // This shouldn't happen if data is consistent, but for safety:
        const earliest = directMatches.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
        return formatResponse(earliest.linkedId || earliest.id);
    }

    const oldestPrimary = primaries[0];
    const oldestPrimaryId = oldestPrimary.id;

    // Rule C: Primary to Secondary Conversion
    // If we have multiple primaries, convert the newer ones (and their dependents) to secondary
    if (primaries.length > 1) {
        const newerPrimaryIds = primaries.slice(1).map(p => p.id);
        await prisma.contact.updateMany({
            where: {
                OR: [
                    { id: { in: newerPrimaryIds } },
                    { linkedId: { in: newerPrimaryIds } },
                ],
            },
            data: {
                linkedId: oldestPrimaryId,
                linkPrecedence: 'secondary',
            },
        });
    }

    // Rule B: Secondary Expansion
    // If the provided email/phone is NOT present in any of the matches, create a new secondary
    const hasEmail = email ? directMatches.some(c => c.email === email) : true;
    const hasPhone = phoneNumber ? directMatches.some(c => c.phoneNumber === phoneNumber) : true;

    if (!hasEmail || !hasPhone) {
        // Double check that it's actually "new" in the entire cluster (not just direct matches)
        const clusterMatches = await prisma.contact.findFirst({
            where: {
                OR: [
                    { linkedId: oldestPrimaryId },
                    { id: oldestPrimaryId }
                ],
                email: email || undefined,
                phoneNumber: phoneNumber || undefined
            }
        });

        if (!clusterMatches) {
            await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: oldestPrimaryId,
                    linkPrecedence: 'secondary',
                },
            });
        }
    }

    return formatResponse(oldestPrimaryId);
}

async function formatResponse(primaryId: number): Promise<ReconciliationResponse> {
    const allContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: primaryId },
                { linkedId: primaryId },
            ],
        },
        orderBy: { createdAt: 'asc' },
    });

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    // Requirements: primary email first, primary phone first
    const primary = allContacts.find(c => c.id === primaryId)!;
    if (primary.email) emails.add(primary.email);
    if (primary.phoneNumber) phoneNumbers.add(primary.phoneNumber);

    allContacts.forEach(c => {
        if (c.id !== primaryId) {
            if (c.email) emails.add(c.email);
            if (c.phoneNumber) phoneNumbers.add(c.phoneNumber);
            secondaryContactIds.push(c.id);
        }
    });

    return {
        contact: {
            primaryContatctId: primaryId,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phoneNumbers),
            secondaryContactIds,
        },
    };
}

