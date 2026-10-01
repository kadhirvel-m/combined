import type { Metadata } from "next";
import { WishlistPage } from "@/features/account/WishlistPage";

export const metadata: Metadata = {
  title: "My Wishlist - Paper X",
  description: "Your saved topics and bookmarks",
};

export default function Page() {
  return <WishlistPage />;
}
