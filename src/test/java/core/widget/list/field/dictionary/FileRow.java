package core.widget.list.field.dictionary;


import java.util.Objects;

public class FileRow {
    public String TYPE;
    public String KEY;
    public String VALUE;
    public int DISPLAY_ORDER;

    public static FileRow fromCsv(String line) {
        String[] parts = line.split(";");
        FileRow r = new FileRow();
        r.TYPE = parts.length > 0 ? parts[0].trim() : "";
        r.KEY = parts.length > 1 ? parts[1].trim() : "";
        r.VALUE = parts.length > 2 ? parts[2].trim() : "";
        r.DISPLAY_ORDER = (parts.length > 3 && !parts[3].trim().isEmpty())
                ? Integer.parseInt(parts[3].trim())
                : Integer.MAX_VALUE;
        return r;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof FileRow other)) return false;
        return Objects.equals(TYPE, other.TYPE)
                && Objects.equals(KEY, other.KEY)
                && Objects.equals(VALUE, other.VALUE)
                && DISPLAY_ORDER == other.DISPLAY_ORDER;
    }

    @Override
    public int hashCode() {
        return Objects.hash(TYPE, KEY, VALUE, DISPLAY_ORDER);
    }
}