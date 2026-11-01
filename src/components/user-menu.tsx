import Image from "next/image";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { SubmitButton } from "./submit-button";

export async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt="" width={32} height={32} className="rounded-full" />
      ) : (
        <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
          {user.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden text-sm font-medium sm:inline" data-testid="user-name">
        {user.name}
      </span>
      <form action={signOut}>
        <SubmitButton variant="ghost" pendingText="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
