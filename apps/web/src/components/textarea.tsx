import { AiOutlineArrowUp, AiOutlineRetweet } from "react-icons/ai";
import { Textarea } from "./ui/textarea";

export default function CustomTextArea({
  isWoke,
  setIsWoke,
  userText,
  setUserText,
  handleSubmit,
}: {
  isWoke: boolean;
  setIsWoke: (isWoke: boolean) => void;
  userText: string;
  setUserText: (userText: string) => void;
  handleSubmit: () => void;
}) {
  return (
    <div className="w-full">
      <div className="py-2 px-4 border-l border-t border-r bg-neutral-950 text-sm mr-4 flex items-center justify-between gap-2">
        <h1
          className={`font-bold font-mono text-xs tracking-widest ${isWoke ? "text-blue-300" : "text-red-300"}`}
        >
          {isWoke ? "WOKE" : "GROYPER"}
        </h1>
        <button className="hover:cursor-pointer" onClick={() => setIsWoke(!isWoke)}>
          <AiOutlineRetweet className="size-4" />
        </button>
      </div>
      <div className="relative">
        <Textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Controversy is a form of communication..."
          className="rounded-none bg-neutral-950/50 w-full p-2 text-sm resize-none pr-[60px]"
        />
        <button onClick={handleSubmit} className="absolute bottom-4 right-4 hover:cursor-pointer">
          <AiOutlineArrowUp
            className={`size-8 p-1 ${userText.length > 0 ? "opacity-100" : "opacity-50"}`}
          />
        </button>
      </div>
      {/* <div className="flex justify-between items-center pt-2">
                <h1 className="text-xs text-neutral-500">3 / 10 free messages remaining</h1>
                <h1 className="text-xs font-mono font-semibold tracking-wider text-purple-300/75">
                  UPGRADE
                </h1>
              </div> */}
    </div>
  );
}
