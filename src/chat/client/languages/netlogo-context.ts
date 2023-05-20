import { LanguageContext } from "../chat-context";

/** NetLogoContext: The context information of the NetLogo model. */
export interface NetLogoContext extends LanguageContext {
    /** Extensions: Extensions in the code. */
    Extensions: string[];
    /** Globals: Globals in the code. */
    Globals: string[];
    /** WidgetGlobals: Globals from the widgets. */
    WidgetGlobals: string[];
    /** Breeds: Breeds in the code. */
    Breeds: Breed[];
    /** Procedures: Procedures in the code. */
    Procedures: Procedure[];
}

/** Breed: Dynamic metadata of a single breed. */
export interface Breed {
    /** Singular: The singular name of the breed. */
    Singular: string;
    /** Plural: The plural name of the breed. */
    Plural: string;
    /** Variables: Variables defined for the breed. */
    Variables: string[];
    /** BreedType: type of the breed. */
    BreedType: BreedType;
}

/** BreedType: Type of the breed. */
export enum BreedType {
    Turtle = 0,
    Patch = 1,
    UndirectedLink = 2,
    DirectedLink = 3,
}

/** Procedure: Dynamic metadata of a procedure. */
export interface Procedure {
    /** Name: The name of the procedure. */
    Name: string;
    /** Arguments: The arguments of the procedure. */
    Arguments: string[];
    /** IsCommand: Is the procedure a command (to) instead of a reporter (to-report)? */
    IsCommand: boolean;
}

/** Diagnostics: A list of diagnostics. */
export interface Diagnostics {
    /** Diagnostics: The diagnostics. */
    Diagnostics: Diagnostic[];
    /** Type: Type of errors. */
    Type: DiagnosticType;
    /** Code: Related code snippet. */
    Code?: string;
    /** Hidden: Is the diagnostics hidden? */
    Hidden?: boolean;
}

/** DiagnosticType: Type of diagnostics. */
export enum DiagnosticType {
    Runtime = "RuntimeError",
    Compile = "CompileError",
}

/** Diagnostic: A diagnostic message. */
export interface Diagnostic {
    /** Message: The message of the diagnostic. */
    Message: string;
    /** Code: The code of the diagnostic. */
    Code: string;
}