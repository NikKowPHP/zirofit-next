"use client";

import Image from 'next/image';
import React from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  defaultSrc: string;
}

export function ProfileImage({ src, alt, width, height, className, defaultSrc }: ProfileImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);

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

export function BannerImage({ src, alt, layout, objectFit, quality, className, defaultSrc }: BannerImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      layout={layout}
      objectFit={objectFit}
      quality={quality}
      className={className}
      onError={() => setImageSrc(defaultSrc)}
    />
  );
}

interface TransformationImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export function TransformationImage({ src, alt, width, height, className }: TransformationImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [error, setError] = React.useState(false);

  if (error) {
    return null; // Or a placeholder div
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
    />
  );
}
