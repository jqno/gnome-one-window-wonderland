const Meta = imports.gi.Meta;

const _eventIds = [];
const _gap = 20;

function init() {
}

function enable() {
    _eventIds.push(global.display.connect('window-created', onWindowCreated));
    _eventIds.push(global.display.connect('window-entered-monitor', onWindowEnteredMonitor));
}

function disable() {
    _eventIds.forEach(e => global.display.disconnect(e));
}

function onWindowCreated(_, win) {
    const act = win.get_compositor_private();
    if (!act) {
        return;
    }
    const id = act.connect('first-frame', _ => {
        resizeWindow(win);
        act.disconnect(id);
    });
}

function onWindowEnteredMonitor(_, _, win) {
    resizeWindow(win);
}

function resizeWindow(win) {
    if (!managedWindow(win)) {
        return;
    }

    const monitor = win.get_monitor();
    const workspace = win.get_workspace();
    const monitorWorkArea = workspace.get_work_area_for_monitor(monitor);

    const x = monitorWorkArea.x + _gap;
    const y = monitorWorkArea.y + _gap;
    const w = monitorWorkArea.width - (2 * _gap);
    const h = monitorWorkArea.height - (2 * _gap);

    win.unmaximize(Meta.MaximizeFlags.BOTH);
    win.move_resize_frame(false, x, y, w, h);
}

function managedWindow(win) {
    const type = win.get_window_type();
    return type === Meta.WindowType.NORMAL && win.allows_resize();
}
