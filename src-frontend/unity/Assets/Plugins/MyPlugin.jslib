mergeInto(LibraryManager.library, {
    UnityIsReady: function(){
        try{
            onUnityReady();
        }
        catch(error){}
    }
})