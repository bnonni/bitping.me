export {};

declare global {
  interface String {
    /** Capitalize string */
    capitalize(): string;
  }
}

String.prototype.capitalize = function (): string {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
