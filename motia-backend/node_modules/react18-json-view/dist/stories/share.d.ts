export declare const argTypes: {
    src: {
        description: string;
    };
    className: {
        control: string;
        description: string;
    };
    style: {
        control: string;
        description: string;
    };
    dark: {
        control: string;
        description: string;
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
    };
    theme: {
        control: string;
        options: string[];
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
    };
    collapseStringsAfterLength: {
        control: string;
        description: string;
        table: {
            defaultValue: {
                summary: number;
            };
        };
    };
    collapseStringMode: {
        control: string;
        options: string[];
        table: {
            defaultValue: {
                summary: string;
            };
        };
    };
    collapseObjectsAfterLength: {
        control: string;
        description: string;
        table: {
            defaultValue: {
                summary: number;
            };
        };
    };
    collapsed: {
        description: string;
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
    };
    enableClipboard: {
        control: string;
        description: string;
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
    };
    matchesURL: {
        control: string;
        description: string;
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
    };
    editable: {
        table: {
            defaultValue: {
                summary: boolean;
            };
        };
        description: string;
    };
    onAdd: {
        description: string;
    };
    onDelete: {
        description: string;
    };
    onEdit: {
        description: string;
    };
    customizeNode: {
        description: string;
    };
    customizeCopy: {
        description: string;
    };
};
export declare const largeArray: (number | {
    1: number;
    2: {
        2: number;
    };
} | (number | (number | number[])[])[])[];
