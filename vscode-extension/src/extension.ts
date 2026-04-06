import * as vscode from 'vscode';

const CONFIG_SECTION = 'bugpedia';
const DEFAULT_API = 'http://localhost:4000';

/**
 * Extension Bugpedia — point d’extension : ajouter auth, pagination, highlight stack.
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('bugpedia.searchError', async () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.document.getText(editor.selection);
    const input =
      selection && selection.trim().length > 0
        ? selection
        : await vscode.window.showInputBox({
            title: 'Message d’erreur ou extrait de stack',
            prompt: 'Sera envoyé comme requête q= à l’API Bugpedia',
          });
    if (!input?.trim()) {
      vscode.window.showInformationMessage('Bugpedia : recherche annulée.');
      return;
    }

    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const apiUrl = config.get<string>('apiUrl', DEFAULT_API);
    const q = encodeURIComponent(input.trim());

    try {
      const res = await fetch(`${apiUrl}/bugs?q=${q}&limit=15`);
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const bugs = (await res.json()) as {
        id: string;
        title: string;
        library: string;
        version: string;
      }[];

      if (!bugs.length) {
        vscode.window.showInformationMessage('Aucun bug Bugpedia pour cette requête.');
        return;
      }

      const picked = await vscode.window.showQuickPick(
        bugs.map((b) => ({
          label: b.title,
          description: `${b.library}@${b.version}`,
          detail: `${apiUrl.replace(/\/$/, '')}/bugs/${b.id}`,
          bug: b,
        })),
        { placeHolder: 'Sélectionnez un bug pour ouvrir la fiche dans le navigateur' },
      );

      if (picked?.detail) {
        await vscode.env.openExternal(vscode.Uri.parse(picked.detail));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      vscode.window.showErrorMessage(`Bugpedia API : ${msg}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
