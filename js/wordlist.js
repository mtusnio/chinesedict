/*
 Zhongwen - A Chinese-English Pop-Up Dictionary
 Copyright (C) 2010-2019 Christian Schiller
 https://chrome.google.com/extensions/detail/kkmlkkjojmombglmlpbpapmhcaljjkde
 */

async function getConfig() {
    return await chrome.storage.local.get([
        "popupColor",
        "toneColors",
        "fontSize",
        "skritterTLD",
        "zhuyin",
        "grammar",
        "simpTrad",
        "toneColorScheme",
        "cantoneseEntriesEnabled",
        "jyutpingEnabled",
        "pinyinEnabled",
        "ttsEnabled",
        "saveToWordList"
    ]);
}

async function getEntries() {
    const entries = (await chrome.storage.local.get(["wordlist"]))["wordlist"]

    if (!entries) {
        return []
    }

    // The data tables require an ID to be present, as in the old version
    // we acquire that by sorting entries by timestamp and giving them IDs
    // based on the sort order
    entries.sort((e1, e2) => e2.timestamp - e1.timestamp);
    const entriesWithIDs = entries.map((entry, i) => {
        return {
            ...entry,
            id: i,
            notes: (entry.notes || '<i>Edit</i>'),
            zhuyin: convert2Zhuyin(entry.pinyin),
        }
    })

    return entriesWithIDs
}

const NOTES_COLUMN = 7;

async function showListIsEmptyNotice(entries) {
    if (entries.length === 0) {
        $('#nodata').show();
    } else {
        $('#nodata').hide();
    }
}

function disableButtons(entries) {
    if (entries.length === 0) {
        $('#saveList').prop('disabled', true);
        $('#selectAll').prop('disabled', true);
        $('#deselectAll').prop('disabled', true);
        $('#delete').prop('disabled', true);
    } else {
        $('#saveList').prop('disabled', false);
        $('#selectAll').prop('disabled', false);
        $('#deselectAll').prop('disabled', false);
        $('#delete').prop('disabled', false);
    }
}

function convert2Zhuyin(pinyin) {
    let zhuyin = [];
    let a = pinyin.split(/[\s·]+/);
    for (let i = 0; i < a.length; i++) {
        let syllable = a[i];
        zhuyin.push(globalThis.accentedPinyin2Zhuyin(syllable));
    }
    return zhuyin.join(' ');
}

function copyEntriesForSaving(entries) {
    let result = [];
    for (let i = 0; i < entries.length; i++) {
        result.push(copyEntryForSaving(entries[i]));
    }
    return result;
}

function copyEntryForSaving(entry) {
    let result = Object.assign({}, entry);
    // don't save these atributes
    delete result.id;
    delete result.zhuyin;
    if (result.notes === '<i>Edit</i>') {
        delete result.notes;
    }
    return result;
}

$(document).ready(async function () {
    const config = await getConfig()
    const entries = await getEntries()

    let showZhuyin = config['zhuyin'] === 'yes';
    let showJyutping = config['jyutpingEnabled'] || 'yes';
    let showPinyin = config['pinyinEnabled'] || 'yes';

    showListIsEmptyNotice(entries);
    disableButtons(entries);

    let wordsElement = $('#words');
    let invalidateRow;
    let table = wordsElement.DataTable({
        data: entries,
        columns: [
            { data: 'id' },
            { data: 'simplified' },
            { data: 'traditional' },
            { data: 'pinyin', visible: showPinyin },
            { data: 'jyutping', visible: showJyutping },
            { data: 'zhuyin', visible: showZhuyin },
            { data: 'definition' },
            { data: 'notes' },
        ]
    });

    wordsElement.find('tbody').on('click', 'tr', function (event) {
        if (!event.target._DT_CellIndex || event.target._DT_CellIndex.column === NOTES_COLUMN) {
            let index = event.currentTarget._DT_RowIndex;
            let entry = entries[index];

            $('#simplified').val(entry.simplified);
            $('#traditional').val(entry.traditional);
            $('#definition').val(entry.definition);
            $('#notes').val(entry.notes === '<i>Edit</i>' ? '' : entry.notes);
            $('#rowIndex').val(index);

            $('#editNotes').modal('show');
            $('#notes').focus();

            invalidateRow = table.row(this).invalidate;

        } else {
            $(this).toggleClass('bg-info');
        }
    });

    $('#editNotes').on('shown.bs.modal', () => $('#notes').focus());

    $('#saveNotes').click(() => {
        let entry = entries[$('#rowIndex').val()];

        entry.notes = $('#notes').val() || '<i>Edit</i>';

        $('#editNotes').modal('hide');
        invalidateRow().draw();
        config['wordlist'] = JSON.stringify(copyEntriesForSaving(entries));
    });

    $('#saveList').click(function () {
        let selected = table.rows('.bg-info').data();

        if (selected.length === 0) {
            return;
        }

        let content = '';
        for (let i = 0; i < selected.length; i++) {
            let entry = selected[i];
            content += entry.simplified;
            content += '\t';
            content += entry.traditional;
            content += '\t';
            if (showPinyin) {
                content += entry.pinyin;
                content += '\t';
            }

            if (showZhuyin) {
                content += entry.zhuyin;
                content += '\t';
            }

            if (showJyutping) {
                content += entry.jyutping;
                content += '\t';
            }
            content += entry.definition;
            content += entry.notes.replace('<i>Edit</i>', '').replace(/[\r\n]/gm, ' ');
            content += '\n';
        }

        let saveBlob = new Blob([content], { "type": "text/plain" });
        let a = document.getElementById('savelink');
        // Handle Chrome and Firefox
        a.href = (window.webkitURL || window.URL).createObjectURL(saveBlob);
        a.click();
    });

    $('#delete').click(function () {
        table.rows('.bg-info').remove();

        entries = table.rows().data().draw(true);

        config['wordlist'] = JSON.stringify(copyEntriesForSaving(entries));

        showListIsEmptyNotice();
        disableButtons();
    });

    $('#selectAll').click(function () {
        $('#words').find('tbody tr').addClass('bg-info');
    });

    $('#deselectAll').click(function () {
        $('#words').find('tbody tr').removeClass('bg-info');
    });
});
