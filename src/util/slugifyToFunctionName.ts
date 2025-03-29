export function slugifyToFunctionName(input: string): string {
    // Convert to lowercase, replace invalid characters with hyphens,
    // and ensure it starts with a valid character
    let slug = input
        .toLowerCase()                  // Convert to lowercase
        .replace(/[^a-z0-9\s-_$]/g, '') // Keep only letters, numbers, spaces, hyphens, underscores, and $
        .trim()                         // Remove leading/trailing spaces
        .replace(/[\s-]+/g, '_');       // Replace spaces and hyphens with underscores

    // If the string starts with a number or is empty, prepend an underscore
    if (!slug || /^[0-9]/.test(slug)) {
        slug = '_' + slug;
    }

    return slug;
}