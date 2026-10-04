import { Icon, type IconProps } from "@/components/ui/Icon";

/** Material Symbols icon at weight 400: the only weight this page's font link loaded. */
export function Glyph({ weight = 400, ...rest }: IconProps) {
  return <Icon weight={weight} {...rest} />;
}
