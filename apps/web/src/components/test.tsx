import {FC} from "react";
import {CreateUserDto} from "@shared-types";

const Test: FC<CreateUserDto> = (props: CreateUserDto) => {
    console.log(props)
    return (
        <div>TestComponent</div>
    );
}

export default Test;
