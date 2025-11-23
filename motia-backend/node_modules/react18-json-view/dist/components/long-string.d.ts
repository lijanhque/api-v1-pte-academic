import React from 'react';
interface Props {
    str: string;
    className: string;
    ctrlClick: ((event: React.MouseEvent) => void) | undefined;
}
declare const LongString: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLSpanElement>>;
export default LongString;
