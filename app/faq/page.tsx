import type { Metadata } from "next";
import FaqPage from "@/screens/FaqPage";

export const metadata: Metadata = {
  title: "FAQ – Escorts UG | Frequently Asked Questions Uganda Escorts",
  description:
    "Got questions about finding escorts in Uganda? Read our FAQ for answers about booking companions in Kampala, Entebbe, Jinja and across Uganda. Safe, verified, discreet.",
  keywords:
    "escorts Uganda FAQ, how to book escort Uganda, escort questions Uganda, call girls Uganda FAQ, Kampala escorts FAQ",
  alternates: {
    canonical: "https://www.hexescortsug.com/faq",
  },
};

export default function Page() {
  return <FaqPage />;
}
