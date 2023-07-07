import { BasicTool, BasicOptions } from "zotero-plugin-toolkit/dist/basic";
import { ManagerTool } from "zotero-plugin-toolkit/dist/basic";
import { UITool } from "zotero-plugin-toolkit/dist/tools/ui";
import { ShortcutManager } from "zotero-plugin-toolkit/dist/managers/shortcut";
import ToolkitGlobal from "zotero-plugin-toolkit/dist/managers/toolkitGlobal";
import { config, version } from "../../package.json";
import { Component } from "./component";

const React = Zotero.getMainWindow().require("react");
const ReactDOM = Zotero.getMainWindow().require("react-dom");

export class Chat {
  private ui: UITool;
  private base: BasicTool;
  private document: Document;

  /**
   * Record the last text entered
   */
  private lastInputText = "";
  /**
   * Default text
   */
  private defaultText = {
    placeholder: "How can I help you today?",
  };
  /**
   * It controls the max line number of commands displayed in `commandsNode`.
   */
  private maxLineNum: number = 12;
  /**
   * The top-level HTML div node of `Chat`
   */
  private rootNode!: HTMLDivElement;
  private loadingNode!: HTMLDivElement;
  private conversationNode!: HTMLDivElement;
  private OPENAI_API_KEY: string | undefined;
  /**
   * The HTML input node of `Prompt`.
   */
  public inputNode!: HTMLInputElement;
  /**
   * Save all commands registered by all addons.
   */
  public commands = [];

  /**
   * Initialize `Prompt` but do not create UI.
   */
  constructor() {
    this.base = new BasicTool();
    this.ui = new UITool();
    this.document = this.base.getGlobal("document");
    this.initializeUI();
  }

  /**
   * Initialize `Prompt` UI and then bind events on it.
   */
  public initializeUI() {
    this.createHTML();
    this.registerShortcut();
  }

  private createHTML() {
    const existingRootNode = this.document.getElementById("react-root");
    existingRootNode?.remove();
    this.rootNode = this.ui.createElement(this.document, "div", {
      id: "react-root",
      styles: {
        position: "fixed",
        top: "0",
        left: "0",
        backgroundColor: "red",
        width: "50%",
        height: "50%",
      },
    });
    this.document.documentElement.appendChild(this.rootNode);
    ReactDOM.render(<Component />, this.document.getElementById("react-root"));
  }

  /**
   * Show commands in a new `commandsContainer`
   * All other `commandsContainer` is hidden
   * @param commands Command[]
   * @param clear remove all `commandsContainer` if true
   */
  // public showCommands(commands: any[], clear: boolean = false) {
  //   if (clear) {
  //     this.chatNode.querySelectorAll('.message').forEach((e: any) => e.remove())
  //   }
  //   this.inputNode.placeholder = this.defaultText.placeholder
  //   const commandsContainer = this.createCommandsContainer()
  //   for (let command of commands) {
  //     if (command.when && !command.when()) {
  //       continue
  //     }
  //     commandsContainer.appendChild(this.createCommandNode(command))
  //   }
  // }

  /**
   * Create a `commandsContainer` div element, append to `commandsContainer` and hide others.
   * @returns commandsNode
   */
  public createCommandsContainer() {
    const commandsContainer = this.ui.createElement(this.document, "div", {
      classList: ["message"],
    });
    // Add to container and hide others
    // this.chatNode.querySelectorAll('.message').forEach((e: any) => {
    //   e.style.display = 'none'
    // })
    this.chatNode
      .querySelector(".conversation")!
      .appendChild(commandsContainer);
    return commandsContainer;
  }

  /**
   * Return current displayed `commandsContainer`
   * @returns
   */
  private getConversationContainer() {
    return [...this.chatNode.querySelectorAll(".message")].find((e: any) => {
      return e.style.display != "none";
    }) as HTMLDivElement;
  }

  /**
   * Called when `escape` key is pressed.
   */
  public exit() {
    // this.inputNode.placeholder = this.defaultText.placeholder;
    // if (this.chatNode.querySelectorAll(".conversation .message").length >= 2) {
    //   (
    //     this.chatNode.querySelector(".message:last-child") as HTMLDivElement
    //   ).remove();
    //   const commandsContainer = this.chatNode.querySelector(
    //     ".message:last-child"
    //   ) as HTMLDivElement;
    //   commandsContainer.style.display = "";
    //   commandsContainer
    //     .querySelectorAll(".commands")
    //     .forEach((e: any) => (e.style.display = "flex"));
    //   this.inputNode.focus();
    // } else {
    //   this.chatNode.style.display = "none";
    // }
  }

  /**
   * Create a commandsContainer and display a text
   */
  public showTip(text: string) {
    const tipNode = this.ui.createElement(this.document, "div", {
      classList: ["tip"],
      properties: {
        innerText: text,
      },
    });
    this.createCommandsContainer().appendChild(tipNode);
    return tipNode;
  }

  private registerShortcut() {
    const shortCut = new ShortcutManager();
    shortCut.register("event", {
      id: "aria-chat-key",
      modifiers: "shift",
      key: "r",
      callback: () => {
        if (this.chatNode.style.display == "none") {
          this.chatNode.style.display = "flex";
          // this.inputNode.focus();
          // this.showCommands(this.commands, true)
        }
      },
    });
  }
}

export async function chat() {
  const dialogData: { [key: string | number]: any } = {
    inputValue: "test",
    checkboxValue: true,
    loadCallback: () => {
      ztoolkit.log(dialogData, "Dialog Opened!");
    },
    unloadCallback: () => {
      ztoolkit.log(dialogData, "Dialog closed!");
    },
  };
  const dialogHelper = new ztoolkit.Dialog(10, 2)
    .addCell(0, 0, {
      tag: "h1",
      properties: { innerHTML: "Chat Window" },
    })
    .addCell(1, 0, {
      tag: "h2",
      properties: { innerHTML: "Conversational AI" },
    })
    .addCell(2, 0, {
      tag: "p",
      properties: {
        innerHTML:
          "Elements with attribute 'data-bind' are binded to the prop under 'dialogData' with the same name.",
      },
      styles: {
        width: "200px",
      },
    })
    .addCell(3, 0, {
      tag: "label",
      namespace: "html",
      attributes: {
        for: "dialog-checkbox",
      },
      properties: { innerHTML: "bind:checkbox" },
    })
    .addCell(
      3,
      1,
      {
        tag: "input",
        namespace: "html",
        id: "dialog-checkbox",
        attributes: {
          "data-bind": "checkboxValue",
          "data-prop": "checked",
          type: "checkbox",
        },
        properties: { label: "Cell 1,0" },
      },
      false
    )
    .addCell(4, 0, {
      tag: "label",
      namespace: "html",
      attributes: {
        for: "dialog-input",
      },
      properties: { innerHTML: "bind:input" },
    })
    .addCell(
      4,
      1,
      {
        tag: "input",
        namespace: "html",
        id: "dialog-input",
        attributes: {
          "data-bind": "inputValue",
          "data-prop": "value",
          type: "text",
        },
      },
      false
    )
    .addCell(5, 0, {
      tag: "h2",
      properties: { innerHTML: "Toolkit Helper Examples" },
    })
    .addCell(
      6,
      0,
      {
        tag: "button",
        namespace: "html",
        attributes: {
          type: "button",
        },
        listeners: [
          {
            type: "click",
            listener: (e: Event) => {
              addon.hooks.onDialogEvents("clipboardExample");
            },
          },
        ],
        children: [
          {
            tag: "div",
            styles: {
              padding: "2.5px 15px",
            },
            properties: {
              innerHTML: "example:clipboard",
            },
          },
        ],
      },
      false
    )
    .addCell(
      7,
      0,
      {
        tag: "button",
        namespace: "html",
        attributes: {
          type: "button",
        },
        listeners: [
          {
            type: "click",
            listener: (e: Event) => {
              addon.hooks.onDialogEvents("filePickerExample");
            },
          },
        ],
        children: [
          {
            tag: "div",
            styles: {
              padding: "2.5px 15px",
            },
            properties: {
              innerHTML: "example:filepicker",
            },
          },
        ],
      },
      false
    )
    .addCell(
      8,
      0,
      {
        tag: "button",
        namespace: "html",
        attributes: {
          type: "button",
        },
        listeners: [
          {
            type: "click",
            listener: (e: Event) => {
              addon.hooks.onDialogEvents("progressWindowExample");
            },
          },
        ],
        children: [
          {
            tag: "div",
            styles: {
              padding: "2.5px 15px",
            },
            properties: {
              innerHTML: "example:progressWindow",
            },
          },
        ],
      },
      false
    )
    .addCell(
      9,
      0,
      {
        tag: "button",
        namespace: "html",
        attributes: {
          type: "button",
        },
        listeners: [
          {
            type: "click",
            listener: (e: Event) => {
              addon.hooks.onDialogEvents("vtableExample");
            },
          },
        ],
        children: [
          {
            tag: "div",
            styles: {
              padding: "2.5px 15px",
            },
            properties: {
              innerHTML: "example:virtualized-table",
            },
          },
        ],
      },
      false
    )
    .addButton("Confirm", "confirm")
    .addButton("Cancel", "cancel")
    .addButton("Help", "help", {
      noClose: true,
      callback: (e) => {
        dialogHelper.window?.alert("Help Clicked! Dialog will not be closed.");
      },
    })
    .setDialogData(dialogData)
    .open("Dialog Example");
  await dialogData.unloadLock.promise;
  ztoolkit.getGlobal("alert")(
    `Close dialog with ${dialogData._lastButtonId}.\nCheckbox: ${dialogData.checkboxValue}\nInput: ${dialogData.inputValue}.`
  );
  ztoolkit.log(dialogData);
}

export class ChatManager extends ManagerTool {
  private chat: Chat;
  /**
   * Save the commands registered from this manager
   */
  constructor(base?: BasicTool | BasicOptions) {
    super(base);
    this.chat = new Chat();
  }

  /**
   * Register commands. Don't forget to call `unregister` on plugin exit.
   * @param commands Command[]
   * @example
   * ```ts
   * let getReader = () => {
   *   return BasicTool.getZotero().Reader.getByTabID(
   *     (Zotero.getMainWindow().Zotero_Tabs).selectedID
   *   )
   * }
   *
   * register([
   *   {
   *     name: "Split Horizontally",
   *     label: "Zotero",
   *     when: () => getReader() as boolean,
   *     callback: (prompt: Prompt) => getReader().menuCmd("splitHorizontally")
   *   },
   *   {
   *     name: "Split Vertically",
   *     label: "Zotero",
   *     when: () => getReader() as boolean,
   *     callback: (prompt: Prompt) => getReader().menuCmd("splitVertically")
   *   }
   * ])
   * ```
   */
  public register(
    commands: {
      name: string;
      label?: string;
      when?: () => boolean;
      callback:
        | ((chat: Chat) => Promise<void>)
        | ((chat: Chat) => void)
        | any[];
    }[]
  ) {
    // this.chat.showCommands([], true)
  }

  /**
   * You can delete a command registed before by its name.
   * @remarks
   * There is a premise here that the names of all commands registered by a single plugin are not duplicated.
   * @param name Command.name
   */
  public unregister(name: string) {
    // // Delete it in this.prompt.commands
    // this.chat.commands = this.prompt.commands.filter(c => {
    //   JSON.stringify(this.commands.find(c => c.name == name)) != JSON.stringify(c)
    // })
    // // Delete it in this.commands
    // this.commands = this.commands.filter(c => c.name != name)
  }

  /**
   * Call `unregisterAll` on plugin exit.
   */
  public unregisterAll() {}
}
