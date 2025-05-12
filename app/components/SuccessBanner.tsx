// import { BODY } from "~/styles";

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="absolute left-0 top-0 w-full bg-light-green px-6 py-3 text-center">
      <p className={""}>{message}</p>
    </div>
  );
}
