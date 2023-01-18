const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {}

function fillPreferencesWindow(win) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-window-wonderland');

    const page = new Adw.PreferencesPage();
    win.add(page);

    const group = new Adw.PreferencesGroup();
    page.add(group);

    const row = new Adw.ActionRow({ title: 'Gap size' });
    group.add(row);

    const spin = new Gtk.SpinButton({
        valign: Gtk.Align.CENTER
    });
    spin.set_range(0, 300);
    spin.set_increments(1, 1);
    row.add_suffix(spin);
    row.activatable_widget = spin;

    settings.bind('gap-size', spin, 'value', Gio.SettingsBindFlags.DEFAULT);
}
