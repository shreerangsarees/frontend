
/**
 * Safely parses a date from various inputs (string, Date, Firestore Timestamp).
 * @param dateInput - The date to parse
 * @returns Date object (may be Invalid Date)
 */
export const parseDate = (dateInput: any): Date => {
    if (!dateInput) return new Date('Invalid Date');

    try {
        // Handle Firestore Timestamp (has seconds/_seconds)
        if (typeof dateInput === 'object') {
            if (dateInput.toDate && typeof dateInput.toDate === 'function') {
                return dateInput.toDate();
            } else if (dateInput._seconds || dateInput.seconds) { // Check for existance not just truthiness to handle 0
                const secs = dateInput._seconds !== undefined ? dateInput._seconds : dateInput.seconds;
                return new Date(secs * 1000);
            } else if (dateInput instanceof Date) {
                return dateInput;
            }
        }

        // Handle String or Number (timestamp)
        return new Date(dateInput);
    } catch (e) {
        console.error("Date parsing error:", e);
        return new Date('Invalid Date');
    }
};

/**
 * Safely formats a date from various inputs (string, Date, Firestore Timestamp).
 * @param dateInput - The date to format
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string or 'N/A' or 'Invalid Date'
 */
export const formatDate = (dateInput: any, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateInput) return 'N/A';

    const date = parseDate(dateInput);

    if (isNaN(date.getTime())) return 'Invalid Date';

    // Default options if none provided
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return date.toLocaleDateString('en-IN', options || defaultOptions);
};

/**
 * Safely formats a time from various inputs.
 * @param dateInput - The date to format
 * @returns Formatted time string
 */
export const formatTime = (dateInput: any): string => {
    if (!dateInput) return '';

    const date = parseDate(dateInput);

    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN');
}
