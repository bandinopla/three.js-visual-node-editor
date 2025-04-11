import { slugifyToFunctionName } from './slugifyToFunctionName';

export class NameManager {
    private nameCounter: Map<string, number> = new Map();
    private usedNames: Set<string> = new Set();

    /**
     * Gets a unique name based on the provided base name
     * @param baseName The base name to generate a unique name from
     * @returns A unique name string
     */
    public getName(baseName: string): string {
        baseName = slugifyToFunctionName(baseName);

        // If baseName isn't used, return it directly
        if (!this.usedNames.has(baseName)) {
            this.usedNames.add(baseName);
            return baseName;
        }

        // Get current counter for this baseName or start at 1
        let counter = this.nameCounter.get(baseName) || 1;

        // Generate padded number (e.g., 001, 002, etc.)
        while (true) {
            const paddedNum = counter.toString().padStart(3, '0');
            const newName = `${baseName}${paddedNum}`;

            if (!this.usedNames.has(newName)) {
                this.usedNames.add(newName);
                this.nameCounter.set(baseName, counter + 1);
                return newName;
            }
            counter++;
        }
    }

    /**
     * Releases a name so it can be reused
     * @param name The name to release
     * @returns boolean indicating if the name was successfully released
     */
    public release(name: string): boolean {
        if (this.usedNames.has(name)) {
            this.usedNames.delete(name);
            return true;
        }
        return false;
    }

    /**
     * Checks if a name is currently in use
     * @param name The name to check
     * @returns boolean indicating if the name is in use
     */
    public isNameUsed(name: string): boolean {
        return this.usedNames.has(name);
    }

    /**
     * Gets all currently used names
     * @returns Array of used names
     */
    public getUsedNames(): string[] {
        return Array.from(this.usedNames);
    }
}
