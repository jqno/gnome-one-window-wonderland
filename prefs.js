import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OneWindowWonderlandPreferences extends ExtensionPreferences {

    fillPreferencesWindow(win) {
        const settings = this.getSettings('org.gnome.shell.extensions.one-window-wonderland');

        const page = new Adw.PreferencesPage();
        win.add(page);

        this.gapSize(page, settings);
        this.forceList(page, settings, win);
        this.ignoreList(page, settings, win);
        this.applicationNote(page);
    }

    gapSize(page, settings) {
        const spin = new Gtk.SpinButton({
            hexpand: true,
            valign: Gtk.Align.CENTER
        });
        spin.set_range(0, 300);
        spin.set_increments(1, 1);

        this.addToPage(page, spin, null, 'Gap Size', 'The size of the gap around the window, in pixels.');
        settings.bind('gap-size', spin, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    forceList(page, settings, parentWin) {
        const textbox = new Gtk.Entry({
            hexpand: true
        });
        const button = new Gtk.Button({ label: 'Add app' });
        button.connect('clicked', () => {
            this.createAppChooserDialog(textbox, parentWin);
        });

        this.addToPage(page, textbox, button, 'Force List',
            'A comma-separated list of names of applications<sup>*</sup> that are forcibly kept in position by this extension.',
            'Note that an application needs to be restarted before this setting takes effect.');
        settings.bind('force-list', textbox, 'text', Gio.SettingsBindFlags.DEFAULT);
    }

    ignoreList(page, settings, parentWin) {
        const textbox = new Gtk.Entry({
            hexpand: true
        });
        const button = new Gtk.Button({ label: 'Add app' });
        button.connect('clicked', () => {
            this.createAppChooserDialog(textbox, parentWin);
        });

        this.addToPage(page, textbox, button, 'Ignore List',
            'A comma-separated list of names of applications<sup>*</sup> that should not be managed by this extension.',
            null);
        settings.bind('ignore-list', textbox, 'text', Gio.SettingsBindFlags.DEFAULT);
    }

    applicationNote(page) {
        const grid = this.createGrid(page);

        const label = new Gtk.Label({
            label: '<sup>*</sup> The name of an application is how it appears in the Activities overview.',
            halign: Gtk.Align.START,
            use_markup: true
        });

        grid.attach(label, 0, 0, 1, 1);
    }

    addToPage(page, widget, button, labelText, explanationText1, explanationText2) {
        const grid = this.createGrid(page);
        const columns = button ? 3 : 2;

        const label = new Gtk.Label({ label: labelText + ':' });
        grid.attach(label, 0, 0, 1, 1);

        grid.attach(widget, 1, 0, 1, 1);
        if (button) {
            grid.attach(button, 2, 0, 1, 1);
        }

        if (explanationText1) {
            const explanation = new Gtk.Label({
                label: '<small>' + explanationText1 + '</small>',
                halign: Gtk.Align.END,
                use_markup: true
            });
            grid.attach(explanation, 0, 1, columns, 1);
        }
        if (explanationText2) {
            const explanation = new Gtk.Label({
                label: '<small>' + explanationText2 + '</small>',
                halign: Gtk.Align.END,
                use_markup: true
            });
            grid.attach(explanation, 0, 2, columns, 1);
        }
    }

    createGrid(page) {
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

    createAppChooserDialog(textbox, parentWin) {
        const dialog = new Gtk.Dialog({
            title: 'Choose an application',
            use_header_bar: 1,
            modal: true,
            resizable: false
        });
        dialog.set_size_request(300, 700);
        dialog.set_transient_for(parentWin);
        dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
        dialog.add_button('Confirm', Gtk.ResponseType.OK);
        dialog.set_default_response(Gtk.ResponseType.OK);

        const listStore = new Gtk.ListStore();
        listStore.set_column_types([GObject.TYPE_STRING]);
        listStore.set_sort_column_id(0, Gtk.SortType.ASCENDING);
        this.getInstalledApps().forEach(a => {
            const iter = listStore.append();
            listStore.set(iter, [0], [a]);
        })

        const appNameColumn = new Gtk.TreeViewColumn({ title: 'Application name' });
        const cellRenderer = new Gtk.CellRendererText();
        appNameColumn.pack_start(cellRenderer, true);
        appNameColumn.add_attribute(cellRenderer, 'text', 0);

        const treeView = new Gtk.TreeView({ model: listStore });
        treeView.append_column(appNameColumn);
        treeView.connect('row-activated', () => {
            dialog.response(Gtk.ResponseType.OK);
        });

        const selection = treeView.get_selection();
        selection.set_mode(Gtk.SelectionMode.SINGLE);

        const scrolledWindow = new Gtk.ScrolledWindow({ vexpand: true });
        scrolledWindow.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC);
        scrolledWindow.set_child(treeView);

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10
        });
        box.append(scrolledWindow);

        dialog.connect('response', (dialog, responseId) => {
            if (responseId === Gtk.ResponseType.OK) {
                const [success, model, iter] = selection.get_selected();
                if (success) {
                    const appName = model.get_value(iter, 0);
                    this.updateAppList(textbox, appName);
                }
            }
            dialog.destroy();
        });
        dialog.get_content_area().append(box);
        dialog.show();
    }

    getInstalledApps() {
        return Gio.AppInfo.get_all()
            .filter(ai => ai.should_show())
            .map(ai => ai.get_name());
    }

    updateAppList(textbox, appName) {
        const content = textbox.get_text();
        if (content) {
            textbox.set_text(content + ', ' + appName);
        }
        else {
            textbox.set_text(appName);
        }
    }
}
