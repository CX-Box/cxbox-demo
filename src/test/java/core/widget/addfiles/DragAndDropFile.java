package core.widget.addfiles;

import static com.codeborne.selenide.Selenide.executeJavaScript;

import com.codeborne.selenide.SelenideElement;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class DragAndDropFile {

    protected final SelenideElement dropZone;


    public void dragAndDropFileUpload(File file) throws IOException {

        String inputId = "seleniumDragAndDropInput";


        executeJavaScript(inputId + "_files = [];");
        executeJavaScript(inputId + "_files.push(new File([new Blob(['" + file.getAbsolutePath() + "'], {type: '" + Files.probeContentType(file.toPath()) + "'})], '" + file.getName() + "'));");


        String targetId = dropZone.getAttribute("id");


        if (targetId == null || targetId.isEmpty()) {
            targetId = "seleniumDragAndDropInput_target";
            executeJavaScript("sId=function(e, i){e.id = i;};sId(arguments[0], arguments[1]);", dropZone, targetId);
        }


        String initEventJS = inputId + "_files.item = function (i) {return this[i];};"
                + "var eve=document.createEvent(\"HTMLEvents\");"
                + "eve.initEvent(\"drop\", true, true);"
                + "eve.dataTransfer = {files:seleniumDragAndDropInput_files};"
                + "eve.preventDefault = function () {};"
                + "eve.type = \"drop\";"
                + "document.getElementById('" + targetId + "').dispatchEvent(eve);";

        executeJavaScript(initEventJS);

        if (targetId.equals("seleniumDragAndDropInput_target")) {
            executeJavaScript("document.getElementById('seleniumDragAndDropInput_target').id = null");
        }
    }
}
