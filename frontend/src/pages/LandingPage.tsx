import { useState, useEffect } from "react";
import { fetchMock } from "@/data/api";
import landingData from "@/data/landing.json";
import { SectionHero } from "@/components/landing/SectionHero";
import { SectionHowItWorks } from "@/components/landing/SectionHowItWorks";
import { SectionFeatures } from "@/components/landing/SectionFeatures";
import { SectionForWho } from "@/components/landing/SectionForWho";
import { SectionInclusion } from "@/components/landing/SectionInclusion";
import { SectionTestimonials } from "@/components/landing/SectionTestimonials";
import { SectionCTA } from "@/components/landing/SectionCTA";

interface LandingData {
  stats: { id: string; value: string; label: string }[];
  heroProfiles: {
    id: string;
    name: string;
    role: string;
    school: string;
    skills: string[];
    avatar: string | null;
  }[];
  steps: {
    id: string;
    number: string;
    icon: string;
    title: string;
    description: string;
  }[];
  platformFeatures: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  profileTypes: {
    id: string;
    icon: string;
    title: string;
    brings: string[];
    seeks: string[];
  }[];
  testimonials: {
    id: string;
    quote: string;
    name: string;
    school: string;
    field: string;
    avatar: string | null;
  }[];
  inclusionFeatures: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
}

export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMock(landingData).then((res) => {
      setData(res.data as LandingData);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SectionHero profiles={data.heroProfiles} stats={data.stats} />
      <SectionHowItWorks steps={data.steps} />
      <SectionFeatures features={data.platformFeatures} />
      <SectionForWho profileTypes={data.profileTypes} />
      <SectionInclusion features={data.inclusionFeatures} />
      <SectionTestimonials testimonials={data.testimonials} />
      <SectionCTA />
    </>
  );
}
