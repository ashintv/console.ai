export interface Event {
    message: string,
    stack: string | undefined,
    source: string | undefined,
    language: string,
    framework: string | undefined
}