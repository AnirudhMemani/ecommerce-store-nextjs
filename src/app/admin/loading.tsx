import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed flex top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 justify-center items-center">
            <LoaderCircle
                className="size-16 animate-spin"
                color="black"
            />
        </div>
    );
}
