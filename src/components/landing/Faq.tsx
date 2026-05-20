"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { faqs } from "@/lib/data/faqs";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function Faq() {
  return (
    <Section id="faq" className="bg-neutral-50">
      <Container size="narrow">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Les questions{" "}
              <span className="text-primary-600">qu'on nous pose</span> tout le
              temps
            </>
          }
          description="Tu as une autre question ? On te répond en moins de 2h."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} variants={fadeUp} custom={i * 0.3}>
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 text-sm"
        >
          <MessageCircle className="h-5 w-5 text-primary-700" />
          <span className="text-neutral-700">
            Une autre question ?{" "}
            <Link
              href="/contact"
              className="font-semibold text-primary-700 underline-offset-4 hover:underline"
            >
              Pose-la nous ici
            </Link>
            , on répond sous 2h.
          </span>
        </motion.div>
      </Container>
    </Section>
  );
}
