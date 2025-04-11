/**
 * Convert a string in camel case to something human readable...
 */
export function decamelcase(str: string) {
    return str
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .trim() // Remove leading space if any
        .toLowerCase(); // Convert to lowercase
}
