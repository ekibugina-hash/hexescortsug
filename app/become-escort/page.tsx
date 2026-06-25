import type { Metadata } from "next";
import BecomeEscortPage from "@/screens/BecomeEscortPage";

export const metadata: Metadata = {
  title: "Become an Escort in Uganda – List Your Profile | Escorts UG",
  description:
    "Join Uganda's #1 escort directory. List your profile on Escorts UG and connect with clients across Kampala, Entebbe, Jinja, Mbarara and all Uganda. Free registration for verified escorts.",
  keywords:
    "become escort Uganda, list escort profile Uganda, join escort directory Uganda, escort jobs Uganda, Kampala escort registration",
  alternates: {
    canonical: "https://www.hexescortsug.com/become-escort",
  },
};

export default function Page() {
  return <BecomeEscortPage />;
}
