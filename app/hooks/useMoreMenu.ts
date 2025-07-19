import { type FetcherSubmitOptions, useFetcher } from "react-router";
import type { MenuAction, MenuActionInput } from "~/types/menu";

import type { ServerResponse } from "~/types/server";

export function useMoreMenu(actionsInput: MenuActionInput[] | undefined) {
  const fetcher = useFetcher<ServerResponse>();

  function setActions(input: MenuActionInput[]): MenuAction[] {
    const actions: MenuAction[] = [];

    for (let i = 0; i < input.length; i++) {
      if (input[i].link) {
        actions.push({
          link: {
            label: input[i].link!.label,
            to: input[i].link!.to,
          },
        });
      } else if (input[i].button) {
        actions.push({
          button: {
            danger: input[i].button!.danger,
            label: input[i].button!.label,
            onClick: () => {
              const submitVals = { intent: input[i].button!.intent };

              const opts = {
                action: input[i].button!.action,
                method: input[i].button!.method ?? "POST",
              } satisfies FetcherSubmitOptions;

              if (!input[i].button?.confirmMessage) {
                fetcher.submit(submitVals, opts);
                return;
              }
              if (confirm(input[i].button?.confirmMessage)) {
                fetcher.submit(submitVals, opts);
              }
            },
          },
        });
      }
    }

    return actions;
  }

  return actionsInput ? setActions(actionsInput) : [];
}
