const ExtensionUtils = imports.misc.extensionUtils;
const Meta = imports.gi.Meta;

class Extension {

    constructor() {
        this.eventIds = [];
        this.gap = 20;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-window-wonderland');
        this.settings.connect('changed::gap-size', () => { this.initSettings(); });
        this.initSettings();

        this.eventIds = [
            global.display.connect('window-created', (_, win) => { this.onWindowCreated(win); }),
            global.display.connect('window-entered-monitor', (_1, _2, win) => { this.onWindowEnteredMonitor(win); })
        ];
    }

    disable() {
        this.eventIds.forEach(e => { global.display.disconnect(e); });
    }

    initSettings() {
        this.gap = this.settings.get_int('gap-size');
    }

    onWindowCreated(win) {
        const act = win.get_compositor_private();
        if (!act) {
            return;
        }
        const id = act.connect('first-frame', _ => {
            this.resizeWindow(win);
            act.disconnect(id);
        });
    }

    onWindowEnteredMonitor(win) {
        this.resizeWindow(win);
    }

    resizeWindow(win) {
        if (!this.isManagedWindow(win)) {
            return;
        }

        const monitor = win.get_monitor();
        const workspace = win.get_workspace();
        const monitorWorkArea = workspace.get_work_area_for_monitor(monitor);

        const x = monitorWorkArea.x + this.gap;
        const y = monitorWorkArea.y + this.gap;
        const w = monitorWorkArea.width - (2 * this.gap);
        const h = monitorWorkArea.height - (2 * this.gap);

        win.unmaximize(Meta.MaximizeFlags.BOTH);
        win.move_resize_frame(false, x, y, w, h);
    }

    isManagedWindow(win) {
        const type = win.get_window_type();
        return type === Meta.WindowType.NORMAL && win.allows_resize();
    }
}

function init() {
    return new Extension();
}

