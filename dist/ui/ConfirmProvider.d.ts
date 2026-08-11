import type { ReactNode } from 'react';
import type { ConfirmRequest, DialogTheme } from './types';
export declare function useConfirm(): (req: ConfirmRequest) => Promise<boolean>;
export interface ConfirmProviderProps {
    children: ReactNode;
    theme?: Partial<DialogTheme>;
}
export declare function ConfirmProvider({ children, theme }: ConfirmProviderProps): import("react").JSX.Element;
