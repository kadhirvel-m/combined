import { Icon, type IconProps } from "@/components/ui/Icon";

/** Material Symbols icon at weight 400, the only weight the original page's font link loaded. */
export function Sym(props: Omit<IconProps, "weight">) {
  return <Icon weight={400} {...props} />;
}
