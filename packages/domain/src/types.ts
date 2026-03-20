export interface Event {
    message: string,
    stack?: string,
    source?: string,
    language: string,
    framework?: string,
    functionName?: string,
    functionContext?: string
}