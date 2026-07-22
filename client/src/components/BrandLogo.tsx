interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export function BrandLogo({
  className = "h-10 w-10 rounded-xl",
  alt = "HubFit",
}: BrandLogoProps) {
  return (
    <img
      src="/hubfit-logo.png"
      alt={alt}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}
