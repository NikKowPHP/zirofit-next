"use client";

import Image from "next/image";
import React from "react";

interface ProfileImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  defaultSrc: string;
}

export function ProfileImage({
  src,
  alt,
  width,
  height,
  className,
  defaultSrc,
}: ProfileImageProps) {
  // If the src is invalid or null, immediately use the default.
  const [imageSrc, setImageSrc] = React.useState(
    src && (src.startsWith("http") || src.startsWith("/")) ? src : defaultSrc,
  );

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageSrc(defaultSrc)}
    />
  );
}

interface BannerImageProps {
  src: string;
  alt: string;
  layout: "fill";
  objectFit: "cover";
  quality: number;
  className: string;
  defaultSrc: string;
}

export function BannerImage({
  src,
  alt,
  quality,
  className,
  defaultSrc,
}: BannerImageProps) {
  const [imageSrc, setImageSrc] = React.useState(
    src && (src.startsWith("http") || src.startsWith("/")) ? src : defaultSrc,
  );

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      quality={quality}
      className={className}
      style={{ objectFit: "cover" }}
      onError={() => setImageSrc(defaultSrc)}
      priority
    />
  );
}

interface TransformationImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export function TransformationImage({
  src,
  alt,
  width,
  height,
  className,
}: TransformationImageProps) {
  const [imageSrc] = React.useState(src);
  const [error, setError] = React.useState(false);

  if (error) {
    return null; // Or a placeholder div
  }
  if (!src) {
    return null;
  }

  // Validate URL format
  const isValidSrc =
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://");
  if (!isValidSrc) {
    return null;
  }
  return (
    <Image
      src={isValidSrc ? imageSrc! : "/default-image.jpg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      priority
    />
  );
}
