"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Modal,
  ProgressBar,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Textarea,
  useToast,
} from "@/components/ui";
import { Markdown } from "@/components/content/Markdown";

const SAMPLE_MD = `### Eigenvalues
When $AX = \\lambda X$, **λ** is the eigenvalue.

$$|A - \\lambda I| = 0$$

\`\`\`python
print("hello")
\`\`\`
`;

export function DesignSystemDemo() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [on, setOn] = useState(true);
  const { toast } = useToast();

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Buttons" description="variant × size" icon="smart_button" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="gradient" icon="bolt">
            Gradient
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="danger" icon="delete">
            Danger
          </Button>
          <Button loading>Loading</Button>
          <Button variant="secondary" size="icon" icon="more_vert" aria-label="More" />
          <ButtonLink href="/about.html" variant="link" iconRight="arrow_forward">
            Link
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <CardHeader title="Badges & avatars" icon="sell" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge>Brand</Badge>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="success" icon="check">
            Success
          </Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
          <Avatar name="Kadhir Vel" />
          <Avatar src="/assets/img/about1.png" name="Photo" size={48} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Form fields" icon="edit_note" />
        <div className="mt-4 grid gap-4">
          <Field label="Email" htmlFor="ds-email" required hint="We never share it.">
            <Input id="ds-email" icon="mail" placeholder="you@example.com" />
          </Field>
          <Field label="Degree" htmlFor="ds-degree">
            <Select id="ds-degree" defaultValue="be">
              <option value="be">B.E.</option>
              <option value="btech">B.Tech</option>
            </Select>
          </Field>
          <Field label="About" htmlFor="ds-about" error="Tell us a little more.">
            <Textarea id="ds-about" invalid />
          </Field>
          <Checkbox label="Remember me" description="Stay signed in on this device" defaultChecked />
          <Switch checked={on} onChange={setOn} label="Developer mode" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Tabs, progress, overlays" icon="tab" />
        <div className="mt-4 space-y-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: "a", label: "Notes", icon: "description" },
              { key: "b", label: "Quiz", icon: "quiz" },
              { key: "c", label: "Videos", icon: "smart_display" },
            ]}
          />
          <Tabs variant="underline" defaultValue="x" items={[{ key: "x", label: "Overview" }, { key: "y", label: "Activity" }]} />
          <ProgressBar value={64} />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Open modal
            </Button>
            <Button variant="secondary" onClick={() => toast("Saved to your library", { tone: "success" })}>
              Show toast
            </Button>
          </div>
          <Skeleton className="h-10" />
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Markdown + KaTeX + code" icon="functions" />
        <Markdown className="mt-4" content={SAMPLE_MD} />
      </Card>

      <Card className="lg:col-span-2" padding="none">
        <EmptyState title="Nothing here yet" description="Generated notes will appear here." action={<Button size="sm">Generate</Button>} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Share notes"
        description="Anyone with the link can view."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Copy link</Button>
          </>
        }
      >
        <Input readOnly value="https://paperx.tech/notes/abc" />
      </Modal>
    </div>
  );
}
