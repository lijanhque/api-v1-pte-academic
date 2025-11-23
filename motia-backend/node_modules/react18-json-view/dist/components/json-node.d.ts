/// <reference types="react" />
interface Props {
    node: any;
    depth: number;
    deleteHandle?: (indexOrName: string | number, parentPath: string[]) => void;
    editHandle?: (indexOrName: string | number, newValue: any, oldValue: any, parentPath: string[]) => void;
    indexOrName?: number | string;
    parent?: Record<string, any> | Array<any>;
    parentPath: string[];
}
export default function JsonNode({ node, depth, deleteHandle: _deleteHandle, indexOrName, parent, editHandle, parentPath }: Props): JSX.Element;
export {};
