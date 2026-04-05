import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";

export function ShadcnFoundationSmoke() {
  return (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>UI Foundation Smoke</CardTitle>
        <CardDescription>
          Hidden render to verify shadcn + Tailwind coexist with MUI providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary">shadcn</Badge>
        <Input placeholder="Smoke input" defaultValue="ok" />
        <Textarea defaultValue="Tailwind + shadcn foundation loaded." />
        <Button size="sm">Smoke button</Button>
      </CardContent>
    </Card>
  );
}
