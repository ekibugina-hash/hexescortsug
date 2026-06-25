
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";

const faqs = [
{
  question: "How do I book an escort through Hex Escorts UG?",
  answer: "Browse our verified profiles, select an escort that meets your preferences, and contact them directly using the provided phone number or messaging system. All contact details are verified and secure."
},
{
  question: "Are all escorts on your platform verified?",
  answer: "Yes, every escort on Hex Escorts UG goes through a thorough verification process. We verify identity, photos, and service authenticity to ensure you connect with genuine professionals."
},
{
  question: "What areas of Uganda do you cover?",
  answer: "We provide comprehensive coverage across Uganda including Kampala, Entebbe, Jinja, Mbarara, Gulu, Fort Portal, Mbale, Masaka, Arua, Mityana, Hoima, Kabale, Soroti, Moroto, Kasese, and many other locations."
},
{
  question: "What services do the escorts provide?",
  answer: "Our escorts offer various professional services including social companionship, massage therapy, event accompaniment, dinner dates, and other adult entertainment services. Each profile clearly outlines the specific services offered."
},
{
  question: "How is my privacy protected?",
  answer: "We take privacy very seriously. All personal information is encrypted and protected. We never share client details with third parties. Our escorts are also committed to maintaining complete discretion."
},
{
  question: "What are your rates and payment methods?",
  answer: "Rates vary depending on the escort and services requested. Each profile includes rate information. Payment arrangements are made directly between you and the escort. We recommend discussing rates and payment methods before booking."
},
{
  question: "Can I become an escort on your platform?",
  answer: "Yes! We're always looking for professional, verified escorts to join our platform. Contact us at +256 727 240 143 or visit our 'Become an Escort' page for registration details and requirements."
},
{
  question: "What safety measures should I take when meeting an escort?",
  answer: "Always meet in safe, public locations initially. Verify the escort's identity matches their profile. Let someone know your plans. Trust your instincts and never feel pressured into anything you're not comfortable with."
},
{
  question: "How do I report inappropriate behavior or fake profiles?",
  answer: "Use the report button on any profile or contact our support team immediately at +256 727 240 143. We take all reports seriously and investigate promptly to maintain platform integrity."
},
{
  question: "Are your services available 24/7?",
  answer: "Yes, our platform is available 24/7 for browsing and booking. Many of our escorts also offer flexible scheduling including evening and weekend appointments. Check individual profiles for availability."
},
{
  question: "What makes Hex Escorts UG different from other platforms?",
  answer: "We focus exclusively on Uganda, ensuring local expertise and cultural understanding. Our rigorous verification process, 24/7 customer support, and commitment to safety and discretion set us apart in the industry."
},
{
  question: "Do you offer services outside major cities?",
  answer: "Yes, we have escorts available in smaller towns and rural areas throughout Uganda. Use our location filter to find services in your specific area, or contact us for assistance finding escorts willing to travel."
}];


const FaqPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 lg:pl-72">
      <div className="lg:hidden h-16"></div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        
        <p className="text-muted-foreground mb-8">
          Find answers to the most common questions about Hex Escorts UG. Our comprehensive 
          FAQ covers everything from booking procedures to safety guidelines.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) =>
          <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        <div className="mt-10 p-6 bg-muted rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Our support team is available 24/7 to assist you with any inquiries.
          </p>
          <div className="space-y-2">
            <p className="font-medium">
              Phone: <span className="text-primary">+256 782828228</span>
            </p>
            <p className="font-medium">
              Email: <span className="text-primary">info@hexescortsug.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hidden admin access */}
      <a
        href="/admin-panel"
        className="fixed bottom-4 right-4 w-2 h-2 opacity-[0.02] hover:opacity-10 rounded-full bg-muted-foreground transition-opacity"
        aria-hidden="true"
      />
    </div>);

};

export default FaqPage;