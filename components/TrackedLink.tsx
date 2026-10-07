"use client";

import { trackMetaEvent } from "@/components/MetaPixel";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Meta Pixel standard event sent on click, e.g. "Contact". */
  metaEvent: string;
  metaParams?: Record<string, unknown>;
};

/** An <a> that reports a Meta Pixel event when clicked; usable from server components. */
export default function TrackedLink({ metaEvent, metaParams, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackMetaEvent(metaEvent, metaParams);
        onClick?.(e);
      }}
    />
  );
}
