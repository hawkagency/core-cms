import type { ReactNode } from 'react';
import type { ConfirmRequest, PromptRequest, DialogTheme } from './types';
export declare function useConfirm(): (req: ConfirmRequest) => Promise<boolean>;
export declare function usePrompt(): (req: PromptRequest) => Promise<string | null>;
export interface ConfirmProviderProps {
    children: ReactNode;
    theme?: Partial<DialogTheme>;
}
export declare function ConfirmProvider({ children, theme }: ConfirmProviderProps): import("react").JSX.Element;
