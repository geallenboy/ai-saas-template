import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface FaqItem {
  id: string
  question: string
  answer: string
}

const items: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is included in the free plan?',
    answer:
      'Our free plan includes access to a limited set of features, perfect for individuals and small teams to get started. You can upgrade at any time to unlock more powerful tools and capabilities.',
  },
  {
    id: 'faq-2',
    question: 'How do you handle data security?',
    answer:
      'Data security is our top priority. We use industry-standard encryption and best practices to protect your information. Our systems are regularly audited to ensure compliance with security standards.',
  },
  {
    id: 'faq-3',
    question: 'Can I customize the templates?',
    answer:
      'Yes, all our templates are fully customizable. You can change colors, fonts, and layouts to match your brand identity. Our documentation provides detailed guides on how to make these changes.',
  },
  {
    id: 'faq-4',
    question: 'What is your refund policy?',
    answer:
      "We offer a 30-day money-back guarantee on all our paid plans. If you're not satisfied with our service, you can request a full refund within the first 30 days of your subscription.",
  },
  {
    id: 'faq-5',
    question: 'Do you offer support for enterprise clients?',
    answer:
      'Absolutely. We have dedicated support plans for enterprise clients, including priority support, dedicated account managers, and custom onboarding. Please contact our sales team for more information.',
  },
]

const Faq = () => {
  const heading = 'Frequently Asked Questions'
  const description =
    'Find answers to common questions about our services, features, and policies.'
  const supportHeading = "Still have questions? We're here to help."
  const supportDescription =
    "Can't find the answer you're looking for? Our support team is available to assist you with any inquiries. Get in touch with us today."
  const supportButtonText = 'Contact Support'
  const supportButtonUrl = '#'

  return (
    <section className="py-16">
      <div className="container space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 font-semibold text-3xl md:mb-4 lg:mb-6 lg:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-lg">{description}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto w-full lg:max-w-3xl"
        >
          {items.map(item => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                <div className="font-medium sm:py-1 lg:py-2 lg:text-lg">
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="sm:mb-1 lg:mb-2">
                <div className="text-muted-foreground lg:text-lg">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-lg bg-accent p-4 text-center md:rounded-xl md:p-6 lg:p-8">
          <div className="relative">
            <Avatar className="-translate-x-[60%] absolute mb-4 size-16 origin-bottom scale-[80%] border bg-white md:mb-5">
              <AvatarImage src="/avatar/2.png" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
            <Avatar className="absolute mb-4 size-16 origin-bottom translate-x-[60%] scale-[80%] border bg-white md:mb-5">
              <AvatarImage src="/avatar/4.png" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
            <Avatar className="mb-4 size-16 border bg-white md:mb-5">
              <AvatarImage src="/avatar/5.png" />
              <AvatarFallback>SU</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="mb-2 max-w-3xl font-semibold lg:text-lg">
            {supportHeading}
          </h3>
          <p className="mb-8 max-w-3xl text-muted-foreground lg:text-lg">
            {supportDescription}
          </p>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" asChild>
              <a href={supportButtonUrl} target="_blank" rel="noreferrer">
                {supportButtonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Faq }
