import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ServicesList } from "@/modules/reimbursement/ui/ServicesList";

import { buildService } from "../support/ServiceTestBuilders";

describe("ServicesList card interactions", () => {
  it("keeps service card navigation separate from the delete action control", () => {
    const deleteServiceAction = vi.fn(async () => ({ status: "idle" as const, message: "", token: 0 }));

    const html = renderToStaticMarkup(
      <ServicesList
        deleteServiceAction={deleteServiceAction}
        services={[
          {
            service: buildService({ id: "service-123", description: "Fisioterapia cervical" }),
            canDelete: true,
            deleteBlockedReason: "",
          },
        ]}
      />,
    );

    expect(html).toContain('href="/services/service-123"');
    expect(html).toContain('aria-label="Ver servicio Fisioterapia cervical"');
    expect(html).toContain("pointer-events-auto");
    expect(html).toContain('aria-label="Eliminar servicio"');
    expect(html).toContain('type="submit"');
  });
});
