const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() { }

function fillPreferencesWindow(win) {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.one-window-wonderland');

    const page = new Adw.PreferencesPage();
    win.add(page);

    gapSize(page, settings);
    forceList(page, settings);
    ignoreList(page, settings);
    applicationNote(page);
}

function gapSize(page, settings) {
    const spin = new Gtk.SpinButton({
        hexpand: true,
        valign: Gtk.Align.CENTER
    });
    spin.set_range(0, 300);
    spin.set_increments(1, 1);

    addToPage(page, spin, 'Gap Size', 'The size of the gap around the window, in pixels.');
    settings.bind('gap-size', spin, 'value', Gio.SettingsBindFlags.DEFAULT);
}

function forceList(page, settings) {
    const textbox = new Gtk.Entry({
        hexpand: true
    });

    addToPage(page, textbox, 'Force List',
        'A comma-separated list of names of applications<sup>*</sup> that are forcibly kept in position by this extension.',
        'Note that an application needs to be restarted before this setting takes effect.');
    settings.bind('force-list', textbox, 'text', Gio.SettingsBindFlags.DEFAULT);
}

function ignoreList(page, settings) {
    const textbox = new Gtk.Entry({
        hexpand: true
    });

    addToPage(page, textbox, 'Ignore List',
        'A comma-separated list of names of applications<sup>*</sup> that should not be managed by this extension.',
        null);
    settings.bind('ignore-list', textbox, 'text', Gio.SettingsBindFlags.DEFAULT);
}

function applicationNote(page) {
    const grid = createGrid(page);

    const label = new Gtk.Label({
        label: '<sup>*</sup> The name of an application is how it appears in the Activities overview.',
        halign: Gtk.Align.START,
        use_markup: true
    });

    grid.attach(label, 0, 0, 1, 1);
}

function addToPage(page, widget, labelText, explanationText1, explanationText2) {
    const grid = createGrid(page);

    const label = new Gtk.Label({ label: labelText + ':' });
    grid.attach(label, 0, 0, 1, 1);

    grid.attach(widget, 1, 0, 1, 1);

    if (explanationText1 !== null) {
        const explanation = new Gtk.Label({
            label: '<small>' + explanationText1 + '</small>',
            halign: Gtk.Align.END,
            use_markup: true
        });
        grid.attach(explanation, 0, 1, 2, 1);
    }
    if (explanationText2 !== null) {
        const explanation = new Gtk.Label({
            label: '<small>' + explanationText2 + '</small>',
            halign: Gtk.Align.END,
            use_markup: true
        });
        grid.attach(explanation, 0, 2, 2, 1);
    }
}

function createGrid(page) {
    const group = new Adw.PreferencesGroup();
    page.add(group);

    const row = new Adw.ActionRow();
    group.add(row);

    const grid = new Gtk.Grid({
        row_spacing: 6,
        column_spacing: 12,
        margin_start: 12,
        margin_end: 12,
        margin_top: 12,
        margin_bottom: 12,
        column_homogeneous: false
    });
    row.set_child(grid);

    return grid;
}
