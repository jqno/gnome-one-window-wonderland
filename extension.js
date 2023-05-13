const ExtensionUtils = imports.misc.extensionUtils;
const Meta = imports.gi.Meta;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;

class Extension {

    constructor() {
        this.eventIds = [];
        this.windowEventIds = [];
        this.glibIdleId = null;
        this.settingId = null;
        this.tracker = null;

        this.gapSize = 20;
        this.forceList = [];
        this.ignoreList = [];
    }

    enable() {
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-window-wonderland');
        this.settingId = this.settings.connect('changed', () => { this.initSettings(); });
        this.initSettings();
        this.tracker = Shell.WindowTracker.get_default();

        this.eventIds = [
            global.display.connect('window-created', (_display, win) => { this.onWindowCreated(win); }),
            global.display.connect('window-entered-monitor', (_display, _monitorIndex, win) => { this.onWindowEnteredMonitor(win); })
        ];
    }

    disable() {
        this.eventIds.forEach(e => { global.display.disconnect(e); });
        this.windowEventIds.forEach(e => e());

        if (this.glibIdleId) {
            GLib.Source.remove(this.glibIdleId);
            this.glibIdleId = null;
        }
        if (this.settingId) {
            this.settings.disconnect(this.settingId);
        }
        this.settings = null;
        this.eventIds = [];
    }

    initSettings() {
        this.gapSize = this.settings.get_int('gap-size');
        this.forceList = this.settings.get_string('force-list').split(',');
        this.ignoreList = this.settings.get_string('ignore-list').split(',');
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

        const appName = this.getAppName(win);
        if (this.isForcedWindow(appName)) {
            const resizeId = win.connect('position-changed', () => {
                this.resizeWindow(win);
            });
            const sizeChangeId = win.connect('size-changed', () => {
                this.resizeWindow(win);
            });
            this.windowEventIds.push(() => win.disconnect(resizeId));
            this.windowEventIds.push(() => win.disconnect(sizeChangeId));
        }
    }

    onWindowEnteredMonitor(win) {
        this.resizeWindow(win);
    }

    resizeWindow(win) {
        const appName = this.getAppName(win);
        if (appName == null || !this.isManagedWindow(win) || this.isIgnoreListedWindow(appName)) {
            return;
        }

        this.glibIdleId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            const monitor = win.get_monitor();
            const workspace = win.get_workspace();
            const monitorWorkArea = workspace.get_work_area_for_monitor(monitor);

            const x = monitorWorkArea.x + this.gapSize;
            const y = monitorWorkArea.y + this.gapSize;
            const w = monitorWorkArea.width - (2 * this.gapSize);
            const h = monitorWorkArea.height - (2 * this.gapSize);

            win.unmaximize(Meta.MaximizeFlags.BOTH);
            win.move_resize_frame(false, x, y, w, h);

            return GLib.SOURCE_REMOVE;
        });
    }

    getAppName(win) {
        const app = this.tracker.get_window_app(win);
        if (app == null) {
            return null;
        }
        return app.get_name();
    }

    isManagedWindow(win) {
        const type = win.get_window_type();
        return type === Meta.WindowType.NORMAL && win.allows_resize();
    }

    isIgnoreListedWindow(appName) {
        return this.isWindowMatching(appName, this.ignoreList);
    }

    isForcedWindow(appName) {
        return this.isWindowMatching(appName, this.forceList);
    }

    isWindowMatching(appName, list) {
        for (let i = 0; i < list.length; i++) {
            if (appName === list[i]) {
                return true;
            }
        }
        return false;
    }
}

function init() {
    return new Extension();
}

