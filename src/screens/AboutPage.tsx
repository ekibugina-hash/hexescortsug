
import { Card, CardContent } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 lg:pl-72">
      <div className="lg:hidden h-16"></div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Hex Escorts UG</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Uganda's Premier Escort Directory</h2>
            <p className="text-muted-foreground mb-4">
              Hex Escorts UG is Uganda's most trusted and comprehensive escort directory, connecting 
              discerning clients with professional companions across the country. We pride ourselves 
              on maintaining the highest standards of quality, discretion, and professionalism in 
              the adult entertainment industry.
            </p>
            <p className="text-muted-foreground">
              Our platform serves as a bridge between clients seeking companionship and verified 
              escort professionals who provide exceptional service throughout Uganda's major cities 
              and regions.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Our Services</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-white">Verified Escort Profiles</h3>
                <p>All escorts on our platform undergo a thorough verification process to ensure authenticity and quality.</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Comprehensive Coverage</h3>
                <p>We serve all major Ugandan cities including Kampala, Entebbe, Jinja, Mbarara, Gulu, and many more locations.</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Professional Companionship</h3>
                <p>Our escorts provide various services including social companionship, massage therapy, and entertainment for events.</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Discretion Guaranteed</h3>
                <p>We maintain the highest levels of privacy and confidentiality for both clients and service providers.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Why Choose Hex Escorts UG?</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-white">Quality Assurance</h3>
                <p>
                  Every escort profile is carefully vetted to ensure you connect with genuine, 
                  professional individuals who take pride in their service.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white">Easy Navigation</h3>
                <p>
                  Our user-friendly platform makes it simple to find exactly what you're looking 
                  for, with advanced filtering by location, services, and preferences.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white">Safe Environment</h3>
                <p>
                  We prioritize the safety of all users through verification processes, reporting 
                  systems, and clear community guidelines.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white">24/7 Support</h3>
                <p>
                  Our customer support team is available around the clock to assist with any 
                  questions or concerns you may have.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For inquiries, support, or to learn more about our services, please don't hesitate 
              to reach out to our team.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> info@hexescortsug.com</p>
              <p><strong>Phone:</strong>Phone: +256 7546737382</p>
              <p><strong>Business Hours:</strong> Available 24/7</p>
              <p><strong>Coverage Area:</strong> All major cities and regions in Uganda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default AboutPage;