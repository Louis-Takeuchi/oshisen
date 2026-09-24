import Image from "next/image";

interface BrandLogoProps {
  src: "/brand-logo.png";
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

/** Preserve the complete artwork and existing layout, serving a smaller WebP when supported. */
export function BrandLogo({ priority = false, ...props }: BrandLogoProps) {
  return (
    <picture style={{ display: "contents" }}>
      <source srcSet="/brand-logo.webp" type="image/webp" />
      <Image
        {...props}
        alt={props.alt}
        unoptimized
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
