import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  showOnlineStatus?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  image,
  showOnlineStatus = true,
  className,
}: UserAvatarProps) {
  return (
    <div className="relative">
      {image ? (
        <Image
          src={image}
          alt={name}
          className={cn(
            "size-10 rounded-full border-2 border-(--primary-blue)/20 bg-cover bg-center bg-no-repeat",
            className,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full border-2 border-(--primary-blue)/20 bg-(--surface-dark) text-white font-bold",
            className,
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {showOnlineStatus && (
        <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-(--background-dark) bg-green-500" />
      )}
    </div>
  );
}
