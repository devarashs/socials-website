/**
 * Progressive enhancement for "copy to clipboard" buttons.
 *
 * Markup contract — a button is picked up when it carries:
 *   data-copy-value      the text to copy
 *   data-copy-status-id  id of an element (ideally role="status") that receives
 *                        the outcome message for screen readers
 * and contains a `[data-copy-label]` element whose text is the visible label.
 *
 * Buttons are expected to ship with the `hidden` attribute and are revealed only
 * when copying can actually work, so a visitor without JavaScript or without the
 * Clipboard API (insecure context, old browser) never sees a dead control.
 */

/** How long the success/failure label stays before reverting. */
const FEEDBACK_DURATION_MS = 2000;

const LABEL_COPIED = 'Copied';
const LABEL_FAILED = 'Failed';

/** The slice of the Clipboard API this module needs; injectable for testing. */
export type ClipboardWriter = Pick<Clipboard, 'writeText'>;

/**
 * Reveals and wires every copy button under `root`.
 *
 * @param root      Subtree to search, usually `document`.
 * @param clipboard Clipboard to write to. When `undefined` the buttons stay
 *                  hidden and the function does nothing.
 */
export function enableCopyButtons(
  root: ParentNode,
  clipboard: ClipboardWriter | undefined,
): void {
  if (!clipboard) return;

  for (const button of root.querySelectorAll<HTMLButtonElement>('button[data-copy-value]')) {
    wireCopyButton(button, clipboard);
  }
}

function wireCopyButton(button: HTMLButtonElement, clipboard: ClipboardWriter): void {
  const valueToCopy = button.dataset.copyValue;
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  if (!valueToCopy || !label) return;

  const statusId = button.dataset.copyStatusId;
  const status = statusId ? button.ownerDocument.getElementById(statusId) : null;
  const idleLabel = label.textContent ?? '';
  let revertTimer: number | undefined;

  const showFeedback = (visibleLabel: string, announcement: string): void => {
    label.textContent = visibleLabel;
    if (status) status.textContent = announcement;

    // A second click inside the window restarts it rather than reverting early.
    window.clearTimeout(revertTimer);
    revertTimer = window.setTimeout(() => {
      label.textContent = idleLabel;
      if (status) status.textContent = '';
    }, FEEDBACK_DURATION_MS);
  };

  button.addEventListener('click', async () => {
    try {
      await clipboard.writeText(valueToCopy);
      showFeedback(LABEL_COPIED, `${valueToCopy} copied to clipboard`);
    } catch {
      // Typically a denied permission. The address is still on screen as a
      // mailto link, so say so plainly instead of failing silently.
      showFeedback(LABEL_FAILED, 'Copy failed. Select the address to copy it manually.');
    }
  });

  button.hidden = false;
}
