const ExtensionUtils = imports.misc.extensionUtils;
const Meta = imports.gi.Meta;
const GLib = imports.gi.GLib;

class Extension {

    misbehavingWindows = ['Firefox'];

    constructor() {
        this.eventIds = [];
        this.gap = 20;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-window-wonderland');
        this.settingId = this.settings.connect('changed::gap-size', () => { this.initSettings(); });
        this.initSettings();

        this.eventIds = [
            global.display.connect('window-created', (_display, win) => { this.onWindowCreated(win); }),
            global.display.connect('window-entered-monitor', (_display, _monitorIndex, win) => { this.onWindowEnteredMonitor(win); })
        ];
    }

    disable() {
        this.eventIds.forEach(e => { global.display.disconnect(e); });
        if (this.settingId) {
            this.settings.disconnect(this.settingId);
        }
        this.settings = null;
        this.eventIds = [];
    }

    initSettings() {
        this.gap = this.settings.get_int('gap-size');
    }

    onWindowCreated(win) {
        const act = win.get_compositor_private();
        if (!act) {
            return;
        }
        const id = act.connect('first-frame', _params => {
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

        if (this.isMisbehavingWindow(win)) {
            const id = win.connect('position-changed', () => {
                this.performResize(win);
                win.disconnect(id);
            });
        }
        else {
            this.performResize(win);
        }
    }

    isManagedWindow(win) {
        const type = win.get_window_type();
        return type === Meta.WindowType.NORMAL && win.allows_resize();
    }

    isMisbehavingWindow(win) {
        for (let i = 0; i < this.misbehavingWindows.length; i++) {
            if (win.get_title().indexOf(this.misbehavingWindows[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    performResize(win) {
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            const monitor = win.get_monitor();
            const workspace = win.get_workspace();
            const monitorWorkArea = workspace.get_work_area_for_monitor(monitor);

            const x = monitorWorkArea.x + this.gap;
            const y = monitorWorkArea.y + this.gap;
            const w = monitorWorkArea.width - (2 * this.gap);
            const h = monitorWorkArea.height - (2 * this.gap);

            win.unmaximize(Meta.MaximizeFlags.BOTH);
            win.move_resize_frame(false, x, y, w, h);

            return GLib.SOURCE_REMOVE;
        });
    }
}

function init() {
    return new Extension();
}

